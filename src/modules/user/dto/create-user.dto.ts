import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { Role } from 'src/modules/roles/interfaces/role.interface';

export class OrganizerProfileDto {
  @IsNotEmpty()
  companyName: string;

  @IsOptional()
  websiteUrl?: string;

  @IsNotEmpty()
  businessType: string;

  @IsNotEmpty()
  country: string;

  @IsOptional()
  socialLinks?: Record<string, string>;
}

export class PodcasterProfileDto {
  @IsNotEmpty()
  podcastName: string;

  @IsNotEmpty()
  hostNames: string[];

  @IsOptional()
  websiteUrl?: string;

  @IsNotEmpty()
  country: string;

  @IsOptional()
  socialLinks?: Record<string, string>;
}
export class RegiserUserDto {
  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  secondName: string;

  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(15, { message: 'Password must be at most 15 characters long' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must contain at least 1 uppercase, 1 lowercase, 1 special character and a number',
    },
  )
  password: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(Role, { each: true })
  @Transform(({ value }) => (value?.length ? value : [Role.ATTENDEE]))
  roles: Role[];

  @IsOptional()
  organizerProfile?: OrganizerProfileDto;

  @IsOptional()
  podcasterProfile?: PodcasterProfileDto;
}
