// src/config/config.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from './config.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

describe('ConfigService', () => {
  let service: ConfigService;
  let model: Model<any>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        {
          provide: getModelToken('Config'),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            findByIdAndUpdate: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
