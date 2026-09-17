import { NextFunction, Request, Response } from 'express';

export const validate = (validator: (req: Request) => string[] | null) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors = validator(req);

    if (errors && errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    return next();
  };
};
