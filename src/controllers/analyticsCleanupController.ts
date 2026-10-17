import type { Request, Response } from 'express';
import { AppDataSource } from '../lib/typeorm.js';
import { PageView } from '../entities/PageView.js';
import { PropertyView } from '../entities/PropertyView.js';
import { ClickEvent } from '../entities/ClickEvent.js';
import { SiteSetting } from '../entities/SiteSetting.js';

export const cleanupAnalyticsData = async (req: Request, res: Response) => {
  try {
    // Get retention days from site settings
    const siteSettingRepo = AppDataSource.getRepository(SiteSetting);
    const settings = await siteSettingRepo.findOne({ where: { id: 'default' } });
    
    const retentionDays = settings?.analyticsRetentionDays || 365;
    
    if (retentionDays <= 0) {
      return res.json({ 
        success: true, 
        message: 'Data retention is disabled (retention days set to 0 or negative). No cleanup performed.',
        deletedCounts: { pageViews: 0, propertyViews: 0, clickEvents: 0 }
      });
    }

    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const pageViewRepo = AppDataSource.getRepository(PageView);
    const propertyViewRepo = AppDataSource.getRepository(PropertyView);
    const clickEventRepo = AppDataSource.getRepository(ClickEvent);

    // Delete old data
    const [pageViewsDeleted] = await pageViewRepo
      .createQueryBuilder()
      .delete()
      .where('createdAt < :cutoffDate', { cutoffDate })
      .execute();

    const [propertyViewsDeleted] = await propertyViewRepo
      .createQueryBuilder()
      .delete()
      .where('createdAt < :cutoffDate', { cutoffDate })
      .execute();

    const [clickEventsDeleted] = await clickEventRepo
      .createQueryBuilder()
      .delete()
      .where('createdAt < :cutoffDate', { cutoffDate })
      .execute();

    res.json({ 
      success: true, 
      message: `Successfully cleaned up analytics data older than ${retentionDays} days.`,
      retentionDays,
      cutoffDate,
      deletedCounts: {
        pageViews: pageViewsDeleted || 0,
        propertyViews: propertyViewsDeleted || 0,
        clickEvents: clickEventsDeleted || 0,
      },
    });
  } catch (error) {
    console.error('Error cleaning up analytics data:', error);
    res.status(500).json({ success: false, message: 'Unable to cleanup analytics data' });
  }
};

export const getAnalyticsRetentionStatus = async (req: Request, res: Response) => {
  try {
    const siteSettingRepo = AppDataSource.getRepository(SiteSetting);
    const settings = await siteSettingRepo.findOne({ where: { id: 'default' } });
    
    const retentionDays = settings?.analyticsRetentionDays || 365;
    
    // Calculate counts of records older than retention period
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const pageViewRepo = AppDataSource.getRepository(PageView);
    const propertyViewRepo = AppDataSource.getRepository(PropertyView);
    const clickEventRepo = AppDataSource.getRepository(ClickEvent);

    const [oldPageViews] = await pageViewRepo
      .createQueryBuilder('pageView')
      .select('COUNT(*)', 'count')
      .where('pageView.createdAt < :cutoffDate', { cutoffDate })
      .getRawMany<{ count: string }>();

    const [oldPropertyViews] = await propertyViewRepo
      .createQueryBuilder('propertyView')
      .select('COUNT(*)', 'count')
      .where('propertyView.createdAt < :cutoffDate', { cutoffDate })
      .getRawMany<{ count: string }>();

    const [oldClickEvents] = await clickEventRepo
      .createQueryBuilder('clickEvent')
      .select('COUNT(*)', 'count')
      .where('clickEvent.createdAt < :cutoffDate', { cutoffDate })
      .getRawMany<{ count: string }>();

    const [totalPageViews] = await pageViewRepo
      .createQueryBuilder('pageView')
      .select('COUNT(*)', 'count')
      .getRawMany<{ count: string }>();

    const [totalPropertyViews] = await propertyViewRepo
      .createQueryBuilder('propertyView')
      .select('COUNT(*)', 'count')
      .getRawMany<{ count: string }>();

    const [totalClickEvents] = await clickEventRepo
      .createQueryBuilder('clickEvent')
      .select('COUNT(*)', 'count')
      .getRawMany<{ count: string }>();

    res.json({ 
      success: true, 
      data: {
        retentionDays,
        cutoffDate,
        oldRecords: {
          pageViews: parseInt(oldPageViews.count, 10),
          propertyViews: parseInt(oldPropertyViews.count, 10),
          clickEvents: parseInt(oldClickEvents.count, 10),
        },
        totalRecords: {
          pageViews: parseInt(totalPageViews.count, 10),
          propertyViews: parseInt(totalPropertyViews.count, 10),
          clickEvents: parseInt(totalClickEvents.count, 10),
        },
      },
    });
  } catch (error) {
    console.error('Error getting analytics retention status:', error);
    res.status(500).json({ success: false, message: 'Unable to get analytics retention status' });
  }
};
