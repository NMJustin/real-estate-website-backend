import type { Request, Response } from 'express';
import { AppDataSource } from '../lib/typeorm.js';
import { SiteSetting } from '../entities/SiteSetting.js';

export const getHomepageContent = async (_req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const settingRepo = AppDataSource.getRepository(SiteSetting);
    let settings = await settingRepo.findOne({ where: {} });

    if (!settings) {
      settings = settingRepo.create({
        heroTitle: 'Find a Place to Call Home',
        heroSubtitle: 'Discover residential, commercial and investment properties that match your needs and goals.',
        heroCtaText: 'Explore Properties',
        heroCtaLink: '/properties',
        aboutTitle: 'About Ingata Real Estate',
        aboutDescription: 'Ingata Real Estate is a real estate company providing property sales, rentals, property management, marketing and related real estate services.',
        aboutCtaText: 'Learn More About Us',
        aboutCtaLink: '/about/our-company',
        servicesTitle: 'Our Services',
        servicesDescription: 'Comprehensive real estate solutions tailored for you.',
        showFeaturedSection: true,
        featuredSectionTitle: 'Featured Properties',
        showServicesSection: true,
        showAboutSection: true,
      });
      settings = await settingRepo.save(settings);
    }

    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

export const updateHomepageContent = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const {
      heroTitle,
      heroSubtitle,
      heroCtaText,
      heroCtaLink,
      heroImageUrl,
      aboutTitle,
      aboutDescription,
      aboutCtaText,
      aboutCtaLink,
      aboutImageUrl,
      servicesTitle,
      servicesDescription,
      showFeaturedSection,
      featuredSectionTitle,
      showServicesSection,
      showAboutSection,
    } = req.body;

    const settingRepo = AppDataSource.getRepository(SiteSetting);
    let settings = await settingRepo.findOne({ where: {} });

    if (settings) {
      Object.assign(settings, {
        heroTitle,
        heroSubtitle,
        heroCtaText,
        heroCtaLink,
        heroImageUrl,
        aboutTitle,
        aboutDescription,
        aboutCtaText,
        aboutCtaLink,
        aboutImageUrl,
        servicesTitle,
        servicesDescription,
        showFeaturedSection,
        featuredSectionTitle,
        showServicesSection,
        showAboutSection,
      });
      settings = await settingRepo.save(settings);
    } else {
      settings = settingRepo.create({
        heroTitle,
        heroSubtitle,
        heroCtaText,
        heroCtaLink,
        heroImageUrl,
        aboutTitle,
        aboutDescription,
        aboutCtaText,
        aboutCtaLink,
        aboutImageUrl,
        servicesTitle,
        servicesDescription,
        showFeaturedSection,
        featuredSectionTitle,
        showServicesSection,
        showAboutSection,
      });
      settings = await settingRepo.save(settings);
    }

    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

export const getHeroSection = async (_req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const settingRepo = AppDataSource.getRepository(SiteSetting);
    const settings = await settingRepo.findOne({ where: {} });
    if (!settings) return res.status(404).json({ success: false, message: 'Homepage content not found' });

    res.json({
      success: true,
      data: {
        heroTitle: settings.heroTitle,
        heroSubtitle: settings.heroSubtitle,
        heroCtaText: settings.heroCtaText,
        heroCtaLink: settings.heroCtaLink,
        heroImageUrl: settings.heroImageUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateHeroSection = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const { heroTitle, heroSubtitle, heroCtaText, heroCtaLink, heroImageUrl } = req.body;

    const settingRepo = AppDataSource.getRepository(SiteSetting);
    let settings = await settingRepo.findOne({ where: {} });

    if (settings) {
      Object.assign(settings, { heroTitle, heroSubtitle, heroCtaText, heroCtaLink, heroImageUrl });
      settings = await settingRepo.save(settings);
    } else {
      settings = settingRepo.create({ heroTitle, heroSubtitle, heroCtaText, heroCtaLink, heroImageUrl });
      settings = await settingRepo.save(settings);
    }

    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

export const getAboutSection = async (_req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const settingRepo = AppDataSource.getRepository(SiteSetting);
    const settings = await settingRepo.findOne({ where: {} });
    if (!settings) return res.status(404).json({ success: false, message: 'Homepage content not found' });

    res.json({
      success: true,
      data: {
        aboutTitle: settings.aboutTitle,
        aboutDescription: settings.aboutDescription,
        aboutCtaText: settings.aboutCtaText,
        aboutCtaLink: settings.aboutCtaLink,
        aboutImageUrl: settings.aboutImageUrl,
        showAboutSection: settings.showAboutSection,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateAboutSection = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const { aboutTitle, aboutDescription, aboutCtaText, aboutCtaLink, aboutImageUrl, showAboutSection } = req.body;

    const settingRepo = AppDataSource.getRepository(SiteSetting);
    let settings = await settingRepo.findOne({ where: {} });

    if (settings) {
      Object.assign(settings, { aboutTitle, aboutDescription, aboutCtaText, aboutCtaLink, aboutImageUrl, showAboutSection });
      settings = await settingRepo.save(settings);
    } else {
      settings = settingRepo.create({ aboutTitle, aboutDescription, aboutCtaText, aboutCtaLink, aboutImageUrl, showAboutSection });
      settings = await settingRepo.save(settings);
    }

    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

export const getServicesSection = async (_req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const settingRepo = AppDataSource.getRepository(SiteSetting);
    const settings = await settingRepo.findOne({ where: {} });
    if (!settings) return res.status(404).json({ success: false, message: 'Homepage content not found' });

    res.json({
      success: true,
      data: {
        servicesTitle: settings.servicesTitle,
        servicesDescription: settings.servicesDescription,
        showServicesSection: settings.showServicesSection,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateServicesSection = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const { servicesTitle, servicesDescription, showServicesSection } = req.body;

    const settingRepo = AppDataSource.getRepository(SiteSetting);
    let settings = await settingRepo.findOne({ where: {} });

    if (settings) {
      Object.assign(settings, { servicesTitle, servicesDescription, showServicesSection });
      settings = await settingRepo.save(settings);
    } else {
      settings = settingRepo.create({ servicesTitle, servicesDescription, showServicesSection });
      settings = await settingRepo.save(settings);
    }

    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

export const getFeaturedSection = async (_req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const settingRepo = AppDataSource.getRepository(SiteSetting);
    const settings = await settingRepo.findOne({ where: {} });
    if (!settings) return res.status(404).json({ success: false, message: 'Homepage content not found' });

    res.json({
      success: true,
      data: {
        showFeaturedSection: settings.showFeaturedSection,
        featuredSectionTitle: settings.featuredSectionTitle,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateFeaturedSection = async (req: Request, res: Response, next: (error: unknown) => void) => {
  try {
    const { showFeaturedSection, featuredSectionTitle } = req.body;

    const settingRepo = AppDataSource.getRepository(SiteSetting);
    let settings = await settingRepo.findOne({ where: {} });

    if (settings) {
      Object.assign(settings, { showFeaturedSection, featuredSectionTitle });
      settings = await settingRepo.save(settings);
    } else {
      settings = settingRepo.create({ showFeaturedSection, featuredSectionTitle });
      settings = await settingRepo.save(settings);
    }

    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};
