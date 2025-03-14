import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EdamamService } from './edamam.service';
import { FoodCache } from './entities/food-cache.entity';
import { SearchTermCache } from './entities/search-term-cache.entity';
import { AutocompleteCache } from './entities/autocomplete-cache.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FoodCache, SearchTermCache, AutocompleteCache]),
  ],
  providers: [EdamamService],
  exports: [EdamamService],
})
export class EdamamModule {}
