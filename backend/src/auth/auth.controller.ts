import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Super Admin login (username/password)' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('login/wallet')
  @ApiOperation({ summary: 'Student/School login bằng wallet address' })
  async loginWithWallet(@Body() body: { walletAddress: string }) {
    return this.authService.loginWithWallet(body.walletAddress);
  }

  @Get('wallet/:address')
  @ApiOperation({ summary: 'Kiểm tra wallet đã đăng ký chưa (API #2)' })
  async checkWallet(@Param('address') address: string) {
    return this.authService.checkWallet(address);
  }
}
