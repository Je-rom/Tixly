import { IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';

export class UpdatePasswordDto {
  @IsNotEmpty({ message: 'Please input your old password' })
  @IsString()
  currentPassword: string;

  @IsNotEmpty({ message: 'Please input your new password' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).+$/,
    {
      message:
        'Password must contain uppercase, lowercase, number, and special character',
    },
  )
  newPassword: string;
}
