import { Body, Controller } from '@nestjs/common';
import {Message, RMQMessage, RMQRoute, RMQValidate} from "nestjs-rmq";
import {AccountChangeProfile} from "@purple/contracts";
import {UserRepository} from "./repositories/user.repository";
import {UserEntity} from "./entities/user.entity";

@Controller()
export class UserCommands {
  constructor(private readonly userRepository: UserRepository) {
  }

  @RMQValidate()
  @RMQRoute(AccountChangeProfile.topic)
  async userInfo(
    @Body() { user, id }: AccountChangeProfile.Request, @RMQMessage msg: Message
  ): Promise<AccountChangeProfile.Response> {
    const existedUser = await this.userRepository.findUserById(id);
    if(!existedUser) {
      throw new Error('The user does not exist!')
    }
    const userEntity = new UserEntity(existedUser).updateProfile(user.displayName);
    await this.userRepository.updateUser(userEntity);
    return {};
  }
}
