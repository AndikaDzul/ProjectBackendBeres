// src/config/config.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigController } from './config.controller';
import { ConfigService } from './config.service';

describe('ConfigController', () => {
  let controller: ConfigController;
  let service: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConfigController],
      providers: [
        {
          provide: ConfigService,
          useValue: {
            getGpsConfig: jest.fn(),
            saveGpsConfig: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ConfigController>(ConfigController);
    service = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getGps', () => {
    it('should return gps config', async () => {
      const mockConfig = {
        loc1: { lat: -6.2088, lng: 106.8456, radius: 100 },
        loc2: { lat: -6.2100, lng: 106.8470, radius: 75 },
      };
      jest.spyOn(service, 'getGpsConfig').mockResolvedValue(mockConfig);

      expect(await controller.getGps()).toBe(mockConfig);
    });
  });

  describe('saveGps', () => {
    it('should save gps config', async () => {
      const mockData = {
        loc1: { lat: -6.2088, lng: 106.8456, radius: 100 },
        loc2: { lat: -6.2100, lng: 106.8470, radius: 75 },
      };
      const mockResult = { ...mockData };
      jest.spyOn(service, 'saveGpsConfig').mockResolvedValue(mockResult);

      expect(await controller.saveGps(mockData)).toBe(mockResult);
    });
  });
});
