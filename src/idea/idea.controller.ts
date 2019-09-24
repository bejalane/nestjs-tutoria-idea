import { Controller, Post, Get, Put, Delete, Body, Param, UsePipes, UseGuards, Query, Request } from '@nestjs/common';
import { ValidationPipe } from '../shared/validation.pipe';
import { IdeaService } from './idea.service';
import { IdeaDTO } from './idea.dto';
import { AuthGuard } from '../shared/auth.guard';
import { User } from '../user/user.decorator';
import { getRoute } from '../shared/request.helper';
import { paginationSettings } from '../shared/pagination.helper';

@Controller('api/idea')
export class IdeaController {
    constructor(private ideaService: IdeaService){}

    @Get()
    showAllIdeas(
        @Query('page') page: number = 0, 
        @Query('limit') limit: number = paginationSettings.limit,
        @Request() req
    ){
        return this.ideaService.showAll({page, limit, route: getRoute(req)});
    }

    @Post()
    @UseGuards(new AuthGuard())
    @UsePipes(new ValidationPipe())
    createIdea(@User() user, @Body() data: IdeaDTO){
        return this.ideaService.create(user.id, data);
    }

    @Get(':id')
    readIdea(@Param('id') id: string){
        return this.ideaService.read(id);
    }

    @Put(':id')
    @UseGuards(new AuthGuard())
    @UsePipes(new ValidationPipe())
    update(@Param('id') id: string, @User() user, @Body() data: Partial<IdeaDTO>){
        return this.ideaService.update(id, user.id, data);
    }

    @Delete(':id')
    @UseGuards(new AuthGuard())
    removeIdea(@Param('id') id: string, @User() user){
        return this.ideaService.destroy(id, user.id);
    }

    @Post(':id/upvote')
    @UseGuards(new AuthGuard())
    @UsePipes(new ValidationPipe())
    upvoteIdea(@Param('id') id: string, @User() user){
        return this.ideaService.upvoteIdea(id, user.id);
    }

    @Post(':id/downvote')
    @UseGuards(new AuthGuard())
    @UsePipes(new ValidationPipe())
    downvoteIdea(@Param('id') id: string, @User() user){
        return this.ideaService.downvoteIdea(id, user.id);
    }

    @Delete(':id/bookmark')
    @UseGuards(new AuthGuard())
    @UsePipes(new ValidationPipe())
    unbookmarkIdea(@Param('id') id: string, @User() user){
        return this.ideaService.unBookmark(id, user.id);
    }
}
