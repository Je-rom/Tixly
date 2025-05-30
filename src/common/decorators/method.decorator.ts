import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { MethodGuard } from '../guards/method.guard';

export function AllowedMethods(...methods: string[]) {
  return applyDecorators(
    SetMetadata('allowedMethods', methods),
    UseGuards(new MethodGuard(methods)),
  );
}
