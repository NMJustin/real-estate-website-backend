import type { Request, Response } from 'express';
import { AppDataSource } from '../lib/typeorm.js';
import { Between, MoreThanOrEqual, LessThanOrEqual, IsNull, In } from 'typeorm';
import { PageView } from '../entities/PageView.js';
import { PropertyView } from '../entities/PropertyView.js';
import { ClickEvent } from '../entities/ClickEvent.js';
import { Inquiry } from '../entities/Inquiry.js';
import { ViewingRequest } from '../entities/ViewingRequest.js';
import { ListingRequest } from '../entities/ListingRequest.js';
import { ContactMessage } from '../entities/ContactMessage.js';
import { PropertySearch } from '../entities/PropertySearch.js';
import { Property } from '../entities/Property.js';
import { Agent } from '../entities/Agent.js';

// Helper function to get managed property IDs for a user
const getManagedPropertyIds = async (userId: string, role: string): Promise<string[]> => {
  if (role === 'agent') {
    const agentRepo = AppDataSource.getRepository(Agent);
    const agent = await agentRepo.findOne({ where: { userId } });
    if (agent) {
      const propertyRepo = AppDataSource.getRepository(Property);
      const properties = await propertyRepo.find({
        where: { agentId: agent.id },
      });
      return properties.map(p => p.id);
    }
  } else if (role === 'property manager') {
    const propertyRepo = AppDataSource.getRepository(Property);
    const properties = await propertyRepo.find({
      where: { propertyManagerId: userId },
    });
    return properties.map(p => p.id);
  }
  return [];
};

// Helper function to get date range
const getDateRange = (period: string) => {
  const now = new Date();
  const start = new Date();
  
  switch (period) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case '7days':
      start.setDate(now.getDate() - 7);
      break;
    case '30days':
      start.setDate(now.getDate() - 30);
      break;
    case '90days':
      start.setDate(now.getDate() - 90);
      break;
    default:
      start.setDate(now.getDate() - 30); // Default to 30 days
  }
  
  return { start, end: now };
};

// Helper function to get previous period for comparison
const getPreviousDateRange = (period: string) => {
  const now = new Date();
  const end = new Date();
  const start = new Date();
  
  switch (period) {
    case 'today':
      // Previous day
      end.setDate(now.getDate() - 1);
      end.setHours(23, 59, 59, 999);
      start.setDate(now.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      break;
    case '7days':
      // Previous 7 days
      end.setDate(now.getDate() - 7);
      start.setDate(now.getDate() - 14);
      break;
    case '30days':
      // Previous 30 days
      end.setDate(now.getDate() - 30);
      start.setDate(now.getDate() - 60);
      break;
    case '90days':
      // Previous 90 days
      end.setDate(now.getDate() - 90);
      start.setDate(now.getDate() - 180);
      break;
    default:
      end.setDate(now.getDate() - 30);
      start.setDate(now.getDate() - 60);
  }
  
  return { start, end };
};

// Get analytics summary for dashboard
export const getAnalyticsSummary = async (req: Request, res: Response) => {
  try {
    const period = (req.query.period as string) || '30days';
    const { start, end } = getDateRange(period);
    const { start: prevStart, end: prevEnd } = getPreviousDateRange(period);
    
    const pageViewRepo = AppDataSource.getRepository(PageView);
    const propertyViewRepo = AppDataSource.getRepository(PropertyView);
    const clickEventRepo = AppDataSource.getRepository(ClickEvent);
    const inquiryRepo = AppDataSource.getRepository(Inquiry);
    const viewingRepo = AppDataSource.getRepository(ViewingRequest);
    const listingRepo = AppDataSource.getRepository(ListingRequest);
    const contactRepo = AppDataSource.getRepository(ContactMessage);
    const searchRepo = AppDataSource.getRepository(PropertySearch);
    
    // Get counts for the current period
    const [
      totalPageViews,
      totalPropertyViews,
      totalClicks,
      totalInquiries,
      totalViewings,
      totalListings,
      totalContacts,
      totalSearches,
    ] = await Promise.all([
      pageViewRepo.count({ where: { createdAt: Between(start, end) } }),
      propertyViewRepo.count({ where: { createdAt: Between(start, end) } }),
      clickEventRepo.count({ where: { createdAt: Between(start, end) } }),
      inquiryRepo.count({ where: { createdAt: Between(start, end) } }),
      viewingRepo.count({ where: { createdAt: Between(start, end) } }),
      listingRepo.count({ where: { createdAt: Between(start, end) } }),
      contactRepo.count({ where: { createdAt: Between(start, end) } }),
      searchRepo.count({ where: { createdAt: Between(start, end) } }),
    ]);
    
    // Get counts for the previous period (for comparison)
    const [
      prevPageViews,
      prevPropertyViews,
      prevClicks,
      prevInquiries,
      prevViewings,
    ] = await Promise.all([
      pageViewRepo.count({ where: { createdAt: Between(prevStart, prevEnd) } }),
      propertyViewRepo.count({ where: { createdAt: Between(prevStart, prevEnd) } }),
      clickEventRepo.count({ where: { createdAt: Between(prevStart, prevEnd) } }),
      inquiryRepo.count({ where: { createdAt: Between(prevStart, prevEnd) } }),
      viewingRepo.count({ where: { createdAt: Between(prevStart, prevEnd) } }),
    ]);
    
    // Calculate percentage changes
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };
    
    // Get click events by type
    const clickEventsByType = await clickEventRepo
      .createQueryBuilder('click')
      .select('click.eventType', 'eventType')
      .addSelect('COUNT(*)', 'count')
      .where('click.createdAt >= :start', { start })
      .andWhere('click.createdAt <= :end', { end })
      .groupBy('click.eventType')
      .getRawMany();
    
    const clickBreakdown = clickEventsByType.reduce((acc: Record<string, number>, item: any) => {
      acc[item.eventType] = parseInt(item.count, 10);
      return acc;
    }, {} as Record<string, number>);
    
    // Get daily page views for chart (last 7 days or period)
    const days = period === 'today' ? 1 : period === '7days' ? 7 : period === '30days' ? 30 : 30;
    const dailyPageViews = await pageViewRepo
      .createQueryBuilder('pageView')
      .select("DATE(pageView.createdAt)", 'date')
      .addSelect('COUNT(*)', 'count')
      .where('pageView.createdAt >= :start', { start })
      .andWhere('pageView.createdAt <= :end', { end })
      .groupBy("DATE(pageView.createdAt)")
      .orderBy("DATE(pageView.createdAt)", 'ASC')
      .getRawMany();
    
    const pageViewTrend = dailyPageViews.map(item => ({
      date: item.date,
      count: parseInt(item.count, 10),
    }));
    
    // Get top properties by views
    const topProperties = await propertyViewRepo
      .createQueryBuilder('propertyView')
      .select('propertyView.propertyId', 'propertyId')
      .addSelect('COUNT(*)', 'viewCount')
      .leftJoin('propertyView.property', 'property')
      .addSelect('property.title', 'title')
      .where('propertyView.createdAt >= :start', { start })
      .andWhere('propertyView.createdAt <= :end', { end })
      .groupBy('propertyView.propertyId, property.title')
      .orderBy('COUNT(*)', 'DESC')
      .limit(5)
      .getRawMany();
    
    const popularProperties = topProperties.map(item => ({
      propertyId: item.propertyId,
      title: item.title || 'Unknown',
      viewCount: parseInt(item.viewCount, 10),
    }));
    
    res.json({
      success: true,
      data: {
        period,
        dateRange: { start, end },
        previousDateRange: { start: prevStart, end: prevEnd },
        summary: {
          totalPageViews,
          totalPropertyViews,
          totalClicks,
          totalInquiries,
          totalViewings,
          totalListings,
          totalContacts,
          totalSearches,
        },
        comparison: {
          pageViewsChange: calculateChange(totalPageViews, prevPageViews),
          propertyViewsChange: calculateChange(totalPropertyViews, prevPropertyViews),
          clicksChange: calculateChange(totalClicks, prevClicks),
          inquiriesChange: calculateChange(totalInquiries, prevInquiries),
          viewingsChange: calculateChange(totalViewings, prevViewings),
        },
        clickBreakdown: {
          CTA: clickBreakdown['CTA'] || 0,
          PHONE: clickBreakdown['PHONE'] || 0,
          EMAIL: clickBreakdown['EMAIL'] || 0,
          WHATSAPP: clickBreakdown['WHATSAPP'] || 0,
          LINK: clickBreakdown['LINK'] || 0,
          BUTTON: clickBreakdown['BUTTON'] || 0,
        },
        pageViewTrend,
        popularProperties,
      },
    });
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics summary' });
  }
};

// Get device breakdown
export const getDeviceBreakdown = async (req: Request, res: Response) => {
  try {
    const period = (req.query.period as string) || '30days';
    const { start, end } = getDateRange(period);
    
    const pageViewRepo = AppDataSource.getRepository(PageView);
    
    const deviceStats = await pageViewRepo
      .createQueryBuilder('pageView')
      .select('pageView.deviceType', 'deviceType')
      .addSelect('COUNT(*)', 'count')
      .where('pageView.createdAt >= :start', { start })
      .andWhere('pageView.createdAt <= :end', { end })
      .groupBy('pageView.deviceType')
      .getRawMany();
    
    const breakdown = deviceStats.reduce((acc, item) => {
      acc[item.deviceType || 'unknown'] = parseInt(item.count, 10);
      return acc;
    }, {} as Record<string, number>);
    
    res.json({
      success: true,
      data: {
        period,
        dateRange: { start, end },
        breakdown,
      },
    });
  } catch (error) {
    console.error('Error fetching device breakdown:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch device breakdown' });
  }
};

// Get traffic sources (UTM parameters)
export const getTrafficSources = async (req: Request, res: Response) => {
  try {
    const period = (req.query.period as string) || '30days';
    const { start, end } = getDateRange(period);
    
    const pageViewRepo = AppDataSource.getRepository(PageView);
    
    const sourceStats = await pageViewRepo
      .createQueryBuilder('pageView')
      .select('pageView.utmSource', 'source')
      .addSelect('COUNT(*)', 'count')
      .where('pageView.createdAt >= :start', { start })
      .andWhere('pageView.createdAt <= :end', { end })
      .andWhere('pageView.utmSource IS NOT NULL')
      .groupBy('pageView.utmSource')
      .orderBy('COUNT(*)', 'DESC')
      .limit(10)
      .getRawMany();
    
    const sources = sourceStats.map(item => ({
      source: item.source || 'Direct',
      count: parseInt(item.count, 10),
    }));
    
    // Add direct traffic (no UTM source)
    const directCount = await pageViewRepo.count({
      where: {
        createdAt: Between(start, end),
        utmSource: IsNull(),
      },
    });
    
    if (directCount > 0) {
      sources.push({ source: 'Direct', count: directCount });
    }
    
    res.json({
      success: true,
      data: {
        period,
        dateRange: { start, end },
        sources,
      },
    });
  } catch (error) {
    console.error('Error fetching traffic sources:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch traffic sources' });
  }
};

// Export analytics data as CSV
export const exportAnalyticsCsv = async (req: Request, res: Response) => {
  try {
    const period = (req.query.period as string) || '30days';
    const { start, end } = getDateRange(period);
    
    const pageViewRepo = AppDataSource.getRepository(PageView);
    const propertyViewRepo = AppDataSource.getRepository(PropertyView);
    const clickEventRepo = AppDataSource.getRepository(ClickEvent);
    
    // Get all data for the period
    const [pageViews, propertyViews, clickEvents] = await Promise.all([
      pageViewRepo.find({
        where: { createdAt: Between(start, end) },
        order: { createdAt: 'DESC' },
      }),
      propertyViewRepo
        .createQueryBuilder('propertyView')
        .leftJoinAndSelect('propertyView.property', 'property')
        .where('propertyView.createdAt >= :start', { start })
        .andWhere('propertyView.createdAt <= :end', { end })
        .orderBy('propertyView.createdAt', 'DESC')
        .getMany(),
      clickEventRepo.find({
        where: { createdAt: Between(start, end) },
        order: { createdAt: 'DESC' },
      }),
    ]);
    
    // Create CSV content
    const csvLines: string[] = [];
    
    // Page Views CSV
    csvLines.push('Page Views');
    csvLines.push('Date,Page Path,Page Title,Device Type,Browser,OS,UTM Source,UTM Medium');
    pageViews.forEach(pv => {
      csvLines.push([
        pv.createdAt.toISOString(),
        pv.pagePath,
        pv.pageTitle || '',
        pv.deviceType || '',
        pv.browser || '',
        pv.os || '',
        pv.utmSource || '',
        pv.utmMedium || '',
      ].join(','));
    });
    csvLines.push('');
    
    // Property Views CSV
    csvLines.push('Property Views');
    csvLines.push('Date,Property ID,Property Title,Device Type,Session Duration');
    propertyViews.forEach(pv => {
      csvLines.push([
        pv.createdAt.toISOString(),
        pv.propertyId,
        pv.property?.title || 'Unknown',
        pv.deviceType || '',
        pv.sessionDurationSeconds || '',
      ].join(','));
    });
    csvLines.push('');
    
    // Click Events CSV
    csvLines.push('Click Events');
    csvLines.push('Date,Event Type,Property ID,Element ID,Element Text,Page Path,Destination URL');
    clickEvents.forEach(ce => {
      csvLines.push([
        ce.createdAt.toISOString(),
        ce.eventType,
        ce.propertyId || '',
        ce.elementId || '',
        ce.elementText || '',
        ce.pagePath,
        ce.destinationUrl || '',
      ].join(','));
    });
    
    const csvContent = csvLines.join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=analytics-${period}-${Date.now()}.csv`);
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting analytics CSV:', error);
    res.status(500).json({ success: false, message: 'Failed to export analytics' });
  }
};

// Get property-specific analytics
export const getPropertyAnalytics = async (req: Request, res: Response) => {
  try {
    const propertyId = req.params.propertyId;
    const period = (req.query.period as string) || '30days';
    const { start, end } = getDateRange(period);
    
    const propertyViewRepo = AppDataSource.getRepository(PropertyView);
    const clickEventRepo = AppDataSource.getRepository(ClickEvent);
    const inquiryRepo = AppDataSource.getRepository(Inquiry);
    const viewingRepo = AppDataSource.getRepository(ViewingRequest);
    
    // Get property-specific metrics
    const [viewCount, clickCount, inquiryCount, viewingCount] = await Promise.all([
      propertyViewRepo
        .createQueryBuilder('propertyView')
        .where('propertyView.propertyId = :propertyId', { propertyId })
        .andWhere('propertyView.createdAt >= :start', { start })
        .andWhere('propertyView.createdAt <= :end', { end })
        .getCount(),
      clickEventRepo
        .createQueryBuilder('click')
        .where('click.propertyId = :propertyId', { propertyId })
        .andWhere('click.createdAt >= :start', { start })
        .andWhere('click.createdAt <= :end', { end })
        .getCount(),
      inquiryRepo
        .createQueryBuilder('inquiry')
        .where('inquiry.propertyId = :propertyId', { propertyId })
        .andWhere('inquiry.createdAt >= :start', { start })
        .andWhere('inquiry.createdAt <= :end', { end })
        .getCount(),
      viewingRepo
        .createQueryBuilder('viewing')
        .where('viewing.propertyId = :propertyId', { propertyId })
        .andWhere('viewing.createdAt >= :start', { start })
        .andWhere('viewing.createdAt <= :end', { end })
        .getCount(),
    ]);
    
    // Get daily view trend for this property
    const dailyViews = await propertyViewRepo
      .createQueryBuilder('propertyView')
      .select("DATE(propertyView.createdAt)", 'date')
      .addSelect('COUNT(*)', 'count')
      .where('propertyView.propertyId = :propertyId', { propertyId })
      .andWhere('propertyView.createdAt >= :start', { start })
      .andWhere('propertyView.createdAt <= :end', { end })
      .groupBy("DATE(propertyView.createdAt)")
      .orderBy("DATE(propertyView.createdAt)", 'ASC')
      .getRawMany();
    
    const viewTrend = dailyViews.map(item => ({
      date: item.date,
      count: parseInt(item.count, 10),
    }));
    
    // Get click breakdown for this property
    const clickBreakdown = await clickEventRepo
      .createQueryBuilder('click')
      .select('click.eventType', 'eventType')
      .addSelect('COUNT(*)', 'count')
      .where('click.propertyId = :propertyId', { propertyId })
      .andWhere('click.createdAt >= :start', { start })
      .andWhere('click.createdAt <= :end', { end })
      .groupBy('click.eventType')
      .getRawMany();
    
    const clickByType = clickBreakdown.reduce((acc: Record<string, number>, item: any) => {
      acc[item.eventType] = parseInt(item.count, 10);
      return acc;
    }, {} as Record<string, number>);
    
    res.json({
      success: true,
      data: {
        propertyId,
        period,
        dateRange: { start, end },
        metrics: {
          viewCount,
          clickCount,
          inquiryCount,
          viewingCount,
        },
        viewTrend,
        clickBreakdown: clickByType,
      },
    });
  } catch (error) {
    console.error('Error fetching property analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch property analytics' });
  }
};

// Get conversion funnel data
export const getConversionFunnel = async (req: Request, res: Response) => {
  try {
    const period = (req.query.period as string) || '30days';
    const { start, end } = getDateRange(period);
    
    const pageViewRepo = AppDataSource.getRepository(PageView);
    const propertyViewRepo = AppDataSource.getRepository(PropertyView);
    const inquiryRepo = AppDataSource.getRepository(Inquiry);
    const viewingRepo = AppDataSource.getRepository(ViewingRequest);
    
    // Get funnel data
    const [pageViews, propertyViews, inquiries, viewings] = await Promise.all([
      pageViewRepo.count({ where: { createdAt: Between(start, end) } }),
      propertyViewRepo.count({ where: { createdAt: Between(start, end) } }),
      inquiryRepo.count({ where: { createdAt: Between(start, end) } }),
      viewingRepo.count({ where: { createdAt: Between(start, end) } }),
    ]);
    
    // Calculate conversion rates
    const propertyViewRate = pageViews > 0 ? (propertyViews / pageViews) * 100 : 0;
    const inquiryRate = propertyViews > 0 ? (inquiries / propertyViews) * 100 : 0;
    const viewingRate = propertyViews > 0 ? (viewings / propertyViews) * 100 : 0;
    
    const funnel = [
      { stage: 'Page Views', count: pageViews, rate: 100 },
      { stage: 'Property Views', count: propertyViews, rate: propertyViewRate },
      { stage: 'Inquiries', count: inquiries, rate: inquiryRate },
      { stage: 'Viewing Requests', count: viewings, rate: viewingRate },
    ];
    
    res.json({
      success: true,
      data: {
        period,
        dateRange: { start, end },
        funnel,
      },
    });
  } catch (error) {
    console.error('Error fetching conversion funnel:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch conversion funnel' });
  }
};
