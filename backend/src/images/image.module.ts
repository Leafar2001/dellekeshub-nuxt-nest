import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ImageService } from './services/image.service';
import { ImageSchema } from './persistence/image.schema';
import { Image } from './persistence/image.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Image.name, schema: ImageSchema }]),
  ],
  providers: [ImageService],
  exports: [ImageService],
})
export class ImageModule {}
