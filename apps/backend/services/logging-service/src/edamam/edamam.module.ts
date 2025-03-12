import { Module } from '@nestjs/common';
import { EdamamService } from './edamam.service';

@Module({
  providers: [EdamamService],
  exports: [EdamamService],
})
export class EdamamModule {}
