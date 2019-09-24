import { IsString } from 'class-validator';
import { UserRO } from '../user/user.dto';
import { UserEntity } from '../user/user.entity';
import { PaginationClass } from '../shared/pagination.helper';

export class IdeaDTO {
  @IsString()
  idea: string;

  @IsString()
  description: string;
}

export class IdeaRO {
  id?: string;
  updated: Date;
  createdDate: Date;
  idea: string;
  description: string;
  author: UserRO;
  upvotes?: UserEntity[];
  downvotes?: UserEntity[];
}

export class IdeaPaginatedRO extends PaginationClass {
  items: IdeaRO[];
}
