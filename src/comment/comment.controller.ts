import {
  Controller,
  Post,
  UseGuards,
  UsePipes,
  Get,
  Param,
  Body,
  Delete,
} from '@nestjs/common';
import { AuthGuard } from '../shared/auth.guard';
import { ValidationPipe } from '../shared/validation.pipe';
import { CommentService } from './comment.service';
import { User } from '../user/user.decorator';
import { CommentDTO } from './comment.dto';
import { UserEntity } from '../user/user.entity';

@Controller('api/comment')
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Get('idea/:id')
  showCommentsByIdea(@Param('id') ideaId: string) {
    return this.commentService.showByIdea(ideaId);
  }

  @Get('user/:id')
  showCommentsByUser(@Param('id') userId: string) {
    return this.commentService.showByUser(userId);
  }

  @Get(':id')
  showComment(@Param('id') id: string) {
    return this.commentService.show(id);
  }

  @Post('idea/:id')
  @UseGuards(new AuthGuard())
  @UsePipes(new ValidationPipe())
  createComment(
    @Param('id') ideaId: string,
    @User() user: UserEntity,
    @Body() data: CommentDTO,
  ) {
    return this.commentService.create(ideaId, user.id, data);
  }

  @Delete(':id')
  @UseGuards(new AuthGuard())
  @UsePipes(new ValidationPipe())
  removeComment(@Param('id') id: string, @User() user: UserEntity) {
    return this.commentService.remove(id, user.id);
  }
}
