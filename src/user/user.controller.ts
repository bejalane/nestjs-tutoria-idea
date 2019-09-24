import {
  Controller,
  Post,
  Get,
  UsePipes,
  Body,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ValidationPipe } from '../shared/validation.pipe';
import { UserDTO, UserRO } from './user.dto';
import { AuthGuard } from '../shared/auth.guard';
import { User } from './user.decorator';

@Controller()
export class UserController {
  constructor(private userService: UserService) {}

  @Get('api/users')
  // @UseGuards(new AuthGuard())
  // showAllUsers(@User() user): Promise<UserRO[]>{
  showAllUsers(): Promise<UserRO[]> {
    return this.userService.showAll();
  }

  @Post('login')
  @UsePipes(new ValidationPipe())
  login(@Body() data: UserDTO): Promise<UserRO> {
    return this.userService.login(data);
  }

  @Post('register')
  @UsePipes(new ValidationPipe())
  register(@Body() data: UserDTO): Promise<UserRO> {
    return this.userService.register(data);
  }

  @Get('auth/checkLogin')
  @UseGuards(new AuthGuard())
  showMe(@User() user) {
    return this.userService.read(user.username);
  }
}
