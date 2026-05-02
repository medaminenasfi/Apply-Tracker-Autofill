import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsService } from '../applications.service';
import { getModelToken } from '@nestjs/mongoose';
import { Application } from '../schemas/application.schema';
import { normalizeUserId } from '../../common/utils/userId.util';

describe('ApplicationsService - userId Flow (E2E)', () => {
  let service: ApplicationsService;
  let mockApplicationModel: any;

  beforeEach(async () => {
    mockApplicationModel = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      findOneAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        {
          provide: getModelToken(Application.name),
          useValue: mockApplicationModel,
        },
      ],
    }).compile();

    service = module.get<ApplicationsService>(ApplicationsService);
  });

  describe('create application', () => {
    it('should use normalized userId when creating application', async () => {
      const mockUserId = '507f1f77bcf86cd799439011'; // ObjectId-like string
      const normalizedUserId = normalizeUserId(mockUserId);
      
      const mockApplication = {
        _id: 'app123',
        userId: normalizedUserId,
        companyName: 'Test Company',
        position: 'Test Position',
        status: 'applied',
      };

      mockApplicationModel.create.mockResolvedValue(mockApplication);

      const result = await service.create(
        { companyName: 'Test Company', position: 'Test Position' },
        mockUserId,
      );

      expect(mockApplicationModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: normalizedUserId,
        }),
      );
      expect(result.userId).toBe(normalizedUserId);
      expect(typeof result.userId).toBe('string');
    });
  });

  describe('findByUserId', () => {
    it('should query with normalized userId', async () => {
      const mockUserId = '507f1f77bcf86cd799439011';
      const normalizedUserId = normalizeUserId(mockUserId);
      
      const mockApplications = [
        { _id: 'app1', userId: normalizedUserId, companyName: 'Company A' },
      ];

      mockApplicationModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockApplications),
      });

      await service.findByUserId(mockUserId);

      expect(mockApplicationModel.find).toHaveBeenCalledWith({
        userId: normalizedUserId,
      });
    });
  });

  describe('findByIdAndUserId', () => {
    it('should query with normalized userId', async () => {
      const mockUserId = '507f1f77bcf86cd799439011';
      const normalizedUserId = normalizeUserId(mockUserId);
      
      const mockApplication = {
        _id: 'app1',
        userId: normalizedUserId,
        companyName: 'Company A',
      };

      mockApplicationModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockApplication),
      });

      await service.findByIdAndUserId('app1', mockUserId);

      expect(mockApplicationModel.findOne).toHaveBeenCalledWith({
        _id: 'app1',
        userId: normalizedUserId,
      });
    });
  });
});
