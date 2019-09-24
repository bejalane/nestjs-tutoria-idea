import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Repository } from 'typeorm';
import { IdeaEntity } from './idea.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IdeaDTO, IdeaRO, IdeaPaginatedRO } from './idea.dto';
import { UserEntity } from '../user/user.entity';
import { Votes } from '../shared/votes.enum';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';

@Injectable()
export class IdeaService {
  constructor(
    @InjectRepository(IdeaEntity)
    private ideaRepository: Repository<IdeaEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  private toResponseObject(idea: IdeaEntity): IdeaRO {
    return { ...idea, author: idea.author.toResponseObject(false) };
  }

  private toPaginatedResponseObject(
    result: Pagination<IdeaEntity>,
  ): IdeaPaginatedRO {
    return {
      ...result,
      items: result.items.map(idea => this.toResponseObject(idea)),
    };
  }

  private ensureOwnership(idea: IdeaEntity, userId: string) {
    if (idea.author.id !== userId) {
      throw new HttpException('Incorrect User', HttpStatus.UNAUTHORIZED);
    }
  }

  private async vote(idea: IdeaEntity, user: UserEntity, vote: Votes) {
    const opposite = vote === Votes.UP ? Votes.DOWN : Votes.UP;
    if (
      idea[opposite].filter(voter => voter.id === user.id).length > 0 ||
      idea[vote].filter(voter => voter.id === user.id).length > 0
    ) {
      //cancel vote (down or up)
      if (idea[opposite].filter(voter => voter.id === user.id).length > 0) {
        idea[opposite] = idea[opposite].filter(voter => voter.id !== user.id);
        idea[vote].push(user);
      } else {
        idea[vote] = idea[vote].filter(voter => voter.id !== user.id);
      }
      await this.ideaRepository.save(idea);
    } else if (idea[vote].filter(voter => voter.id === user.id).length < 1) {
      //add vote to idea
      idea[vote].push(user);
      await this.ideaRepository.save(idea);
    } else {
      throw new HttpException('Unable to add vote', HttpStatus.BAD_REQUEST);
    }
    return idea;
  }

  // async showAll(page: number = 1): Promise<IdeasRO>{
  //     const perPage = this.pagingSettings.perPage;
  //     const ideas = await this.ideaRepository.find({
  //         relations: ['author', 'upvotes', 'downvotes', 'comments'],
  //         take: perPage,
  //         skip: perPage * (page - 1),
  //         order: {createdDate: 'DESC'}
  //     });
  //     const total = 1;

  //     return {
  //         ideas: ideas.map(idea => this.toResponseObject(idea)),
  //         count: total
  //     }
  // }

  async showAll(options: IPaginationOptions): Promise<IdeaPaginatedRO> {
    const results = await paginate<IdeaEntity>(this.ideaRepository, options, {
      relations: ['author', 'upvotes', 'downvotes', 'comments'],
      order: { createdDate: 'DESC' },
    });
    return this.toPaginatedResponseObject(results);
  }

  async create(userId: string, data: IdeaDTO): Promise<IdeaRO> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const idea = await this.ideaRepository.create({ ...data, author: user });
    await this.ideaRepository.save(idea);
    return this.toResponseObject(idea);
  }

  async read(id: string): Promise<IdeaRO> {
    const idea = await this.ideaRepository.findOne({
      where: { id },
      relations: ['author', 'upvotes', 'downvotes', 'comments'],
    });
    if (!idea) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    return this.toResponseObject(idea);
  }

  async update(
    id: string,
    userId: string,
    data: Partial<IdeaDTO>,
  ): Promise<IdeaRO> {
    let idea = await this.ideaRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!idea) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    this.ensureOwnership(idea, userId);
    await this.ideaRepository.update({ id }, data);
    idea = await this.ideaRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    return this.toResponseObject(idea);
  }

  async destroy(id: string, userId: string) {
    const idea = await this.ideaRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!idea) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    this.ensureOwnership(idea, userId);
    await this.ideaRepository.delete({ id });
    return this.toResponseObject(idea);
  }

  async upvoteIdea(id: string, userId: string) {
    let idea = await this.ideaRepository.findOne({
      where: { id },
      relations: ['author', 'upvotes', 'downvotes'],
    });
    const user = await this.userRepository.findOne({ where: { id: userId } });
    idea = await this.vote(idea, user, Votes.UP);
    return this.toResponseObject(idea);
  }

  async downvoteIdea(id: string, userId: string) {
    let idea = await this.ideaRepository.findOne({
      where: { id },
      relations: ['author', 'upvotes', 'downvotes'],
    });
    const user = await this.userRepository.findOne({ where: { id: userId } });
    idea = await this.vote(idea, user, Votes.DOWN);
    return this.toResponseObject(idea);
  }

  async bookmark(id: string, userId: string) {
    const idea = await this.ideaRepository.findOne({ where: { id } });
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['bookmarks'],
    });

    if (user.bookmarks.filter(bookmark => bookmark.id === idea.id).length < 1) {
      user.bookmarks.push(idea);
      await this.userRepository.save(user);
    } else {
      throw new HttpException(
        'Idea already bookmarked',
        HttpStatus.BAD_REQUEST,
      );
    }

    return user.toResponseObject();
  }

  async unBookmark(id: string, userId: string) {
    const idea = await this.ideaRepository.findOne({ where: { id } });
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['bookmarks'],
    });

    if (user.bookmarks.filter(bookmark => bookmark.id === idea.id).length > 0) {
      user.bookmarks = user.bookmarks.filter(
        bookmark => bookmark.id !== idea.id,
      );
      await this.userRepository.save(user);
    } else {
      throw new HttpException(
        'User have not bookmarked this idea',
        HttpStatus.BAD_REQUEST,
      );
    }

    return user.toResponseObject();
  }
}
