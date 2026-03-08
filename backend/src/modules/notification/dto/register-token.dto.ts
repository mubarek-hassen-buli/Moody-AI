import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterTokenDto {
  /**
   * The Expo Push Token generated on the mobile device.
   * Example: ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
   */
  @IsString()
  @IsNotEmpty()
  token: string;
}
