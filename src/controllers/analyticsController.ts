import type { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { AppDataSource } from '../lib/typeorm.js';
import { PageView } from '../entities/PageView.js';
import { PropertyView } from '../entities/PropertyView.js';
import { ClickEvent } from '../entities/ClickEvent.js';

// Get client IP address from request
const getClientIp = (req: Request): string | undefined => {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
    (req.headers['x-real-ip'] as string) ||
    req.socket.remoteAddress ||
    undefined
  );
};

// Get user agent info
const getUserAgentInfo = (req: Request) => {
  const userAgent = req.headers['user-agent'] || '';
  
  // Simple device type detection
  const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);
  const deviceType = isMobile ? 'mobile' : 'desktop';
  
  // Simple browser detection
  let browser = 'unknown';
  if (userAgent.includes('Chrome')) browser = 'chrome';
  else if (userAgent.includes('Firefox')) browser = 'firefox';
  else if (userAgent.includes('Safari')) browser = 'safari';
  else if (userAgent.includes('Edge')) browser = 'edge';
  
  // Simple OS detection
  let os = 'unknown';
  if (userAgent.includes('Windows')) os = 'windows';
  else if (userAgent.includes('Mac')) os = 'macos';
  else if (userAgent.includes('Linux')) os = 'linux';
  else if (userAgent.includes('Android')) os = 'android';
  else if (userAgent.includes('iOS')) os = 'ios';
  
  return { deviceType, browser, os };
};

// Parse UTM parameters from query string
const parseUtmParams = (query: any) => ({
  utmSource: query.utm_source || undefined,
  utmMedium: query.utm_medium || undefined,
  utmCampaign: query.utm_campaign || undefined,
  utmTerm: query.utm_term || undefined,
  utmContent: query.utm_content || undefined,
});

export const trackPageView = async (req: Request, res: Response) => {
  try {
    const pageViewRepo = AppDataSource.getRepository(PageView);
    const { deviceType, browser, os } = getUserAgentInfo(req);
    const utmParams = parseUtmParams(req.query);
    
    const pageView = pageViewRepo.create({
      id: randomUUID(),
      userId: (req as any).user?.id || undefined,
      sessionId: req.headers['x-session-id'] as string || undefined,
      pagePath: req.body.pagePath || req.query.pagePath || req.path,
      pageTitle: req.body.pageTitle || undefined,
      referrer: req.headers.referer || req.body.referrer || undefined,
      ...utmParams,
      deviceType,
      browser,
      os,
      ipAddress: getClientIp(req),
      country: req.body.country || undefined,
      city: req.body.city || undefined,
    });
    
    await pageViewRepo.save(pageView);
    
    res.status(201).json({ success: true, data: { id: pageView.id } });
  } catch (error) {
    console.error('Error tracking page view:', error);
    // Don't fail the request if tracking fails
    res.status(200).json({ success: true, message: 'Page view tracking skipped' });
  }
};

export const trackPropertyView = async (req: Request, res: Response) => {
  try {
    const propertyViewRepo = AppDataSource.getRepository(PropertyView);
    const { deviceType } = getUserAgentInfo(req);
    
    const propertyView = propertyViewRepo.create({
      id: randomUUID(),
      userId: (req as any).user?.id || undefined,
      sessionId: req.headers['x-session-id'] as string || undefined,
      propertyId: req.body.propertyId || req.params.propertyId,
      sessionDurationSeconds: req.body.sessionDurationSeconds || undefined,
      referrer: req.headers.referer || req.body.referrer || undefined,
      deviceType,
      ipAddress: getClientIp(req),
    });
    
    await propertyViewRepo.save(propertyView);
    
    res.status(201).json({ success: true, data: { id: propertyView.id } });
  } catch (error) {
    console.error('Error tracking property view:', error);
    res.status(200).json({ success: true, message: 'Property view tracking skipped' });
  }
};

export const trackClickEvent = async (req: Request, res: Response) => {
  try {
    const clickEventRepo = AppDataSource.getRepository(ClickEvent);
    const { deviceType } = getUserAgentInfo(req);
    
    const clickEvent = clickEventRepo.create({
      id: randomUUID(),
      userId: (req as any).user?.id || undefined,
      sessionId: req.headers['x-session-id'] as string || undefined,
      eventType: req.body.eventType,
      propertyId: req.body.propertyId || undefined,
      elementId: req.body.elementId || undefined,
      elementText: req.body.elementText || undefined,
      pagePath: req.body.pagePath || req.path,
      destinationUrl: req.body.destinationUrl || undefined,
      deviceType,
      ipAddress: getClientIp(req),
    });
    
    await clickEventRepo.save(clickEvent);
    
    res.status(201).json({ success: true, data: { id: clickEvent.id } });
  } catch (error) {
    console.error('Error tracking click event:', error);
    res.status(200).json({ success: true, message: 'Click event tracking skipped' });
  }
};
