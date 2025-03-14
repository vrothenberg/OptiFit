import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FoodService } from './food.service';
import { FoodController } from './food.controller';
import { FoodSearchController } from './food-search.controller';
import { FoodLog } from './entities/food-log.entity';
import { EdamamModule } from '../edamam/edamam.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FoodLog]),
    EdamamModule
  ],
  controllers: [FoodController, FoodSearchController],
  providers: [FoodService],
  exports: [FoodService],
})
export class FoodModule {}
