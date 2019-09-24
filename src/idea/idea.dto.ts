import { IsString } from 'class-validator';
import { UserRO } from '../user/user.dto';
import { UserEntity } from '../user/user.entity';

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

export class IdeasRO {
    ideas: IdeaRO[];
    count: number;
}