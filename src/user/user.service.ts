import { Injectable, Body, HttpException, HttpStatus } from '@nestjs/common';
import { UserEntity } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDTO } from './user.dto';

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>
    ){}

    async showAll(){
        const users = await this.userRepository.find({relations: ['ideas']});
        return users.map(user => user.toResposeObject(false));
    }

    async login(data: UserDTO){
        const {username, password} = data;
        const user = await this.userRepository.findOne({where: {username}});
        if(!user || !(await user.comparePassword(password))){
            throw new HttpException('Invalid Username/Password', HttpStatus.BAD_REQUEST);
        }
        return user.toResposeObject();
    }

    async register(data: UserDTO){
        const {username, password} = data;
        let user = await this.userRepository.findOne({where: {username}});
        if(user){
            throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
        }
        user = await this.userRepository.create(data);
        await this.userRepository.save(user);
        return user.toResposeObject();
    }

}
