import { Controller, Post, Get, Put, Delete, Body, Param, UsePipes, UseGuards } from '@nestjs/common';
import { ValidationPipe } from '../shared/validation.pipe';
import { IdeaService } from './idea.service';
import { IdeaDTO } from './idea.dto';
import { AuthGuard } from '../shared/auth.guard';
import { User } from '../user/user.decorator';

@Controller('api/idea')
export class IdeaController {
    constructor(private ideaService: IdeaService){}

    @Get()
    showAllIdeas(){
        return this.ideaService.showAll();
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

    @Post(':id/bookmark')
    @UseGuards(new AuthGuard())
    @UsePipes(new ValidationPipe())
    bookmarkIdea(@Param('id') id: string, @User() user){
        return this.ideaService.bookmark(id, user.id);
    }

    @Delete(':id/bookmark')
    @UseGuards(new AuthGuard())
    @UsePipes(new ValidationPipe())
    unbookmarkIdea(@Param('id') id: string, @User() user){
        return this.ideaService.unBookmark(id, user.id);
    }
}
