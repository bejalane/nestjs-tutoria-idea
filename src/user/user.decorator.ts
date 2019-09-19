import { createParamDecorator } from "@nestjs/common";

export const User = createParamDecorator((data, req) => {
    console.log('DATA: ', data);
    console.log('req: ', req.user);
    return data ? req.user[data] : req.user;
});