import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
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

export class RegiserUserDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
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
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).+$/,
    {
      message:
        'Password must contain uppercase, lowercase, number, and special character',
    },
  )
  password: string;

  @IsEnum(Role, {
    message: 'Role must be either ATTENDEE or ORGANIZER',
  })
  @Transform(({ value }) => (value?.length ? value : [Role.ATTENDEE]))
  role: Role;

  @IsOptional()
  organizerProfile?: OrganizerProfileDto;
}
