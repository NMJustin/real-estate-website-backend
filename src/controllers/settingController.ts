import type { Request, Response } from 'express';
import { AppDataSource } from '../lib/typeorm.js';
import { SiteSetting } from '../entities/SiteSetting.js';

export const getSettings = async (_req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const settingRepo = AppDataSource.getRepository(SiteSetting);
    let settings = await settingRepo.findOne({ where: {} });

    if (!settings) {
      settings = settingRepo.create({
        siteName: 'Ingata Real Estate',
        email: 'ingatatechnologiesltd@gmail.com',
        phone: '+250 796 593 119',
        whatsapp: '+250796593119',
        address: 'KG 11 Ave, Zindiro, AZAM Rond Point, Gasabo-Kigali',
        facebookUrl: 'https://facebook.com',
        xUrl: 'https://twitter.com',
        instagramUrl: 'https://instagram.com',
        linkedinUrl: 'https://linkedin.com',
        defaultCurrency: 'RWF',
      });
      settings = await settingRepo.save(settings);
    }

    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const {
      siteName, logoUrl, faviconUrl, email, phone, whatsapp, address,
      facebookUrl, instagramUrl, xUrl, linkedinUrl, defaultCurrency,
      heroTitle, heroSubtitle, heroCtaText, heroCtaLink, aboutTitle,
      aboutDescription, aboutCtaText, aboutCtaLink, servicesTitle,
      servicesDescription, featuredSectionTitle, showAboutSection,
      showFeaturedSection, showServicesSection,
    } = req.body;
    const settingValues = {
      siteName, logoUrl, faviconUrl, email, phone, whatsapp, address,
      facebookUrl, instagramUrl, xUrl, linkedinUrl, defaultCurrency,
      heroTitle, heroSubtitle, heroCtaText, heroCtaLink, aboutTitle,
      aboutDescription, aboutCtaText, aboutCtaLink, servicesTitle,
      servicesDescription, featuredSectionTitle, showAboutSection,
      showFeaturedSection, showServicesSection,
    };
    const updatedValues = Object.fromEntries(
      Object.entries(settingValues).filter(([, value]) => value !== undefined),
    );

    const settingRepo = AppDataSource.getRepository(SiteSetting);
    let settings = await settingRepo.findOne({ where: {} });

    if (settings) {
      Object.assign(settings, updatedValues);
      settings = await settingRepo.save(settings);
    } else {
      settings = settingRepo.create(updatedValues);
      settings = await settingRepo.save(settings);
    }

    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};
