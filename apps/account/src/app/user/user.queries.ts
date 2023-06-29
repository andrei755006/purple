import {Body, Controller} from '@nestjs/common';
import {Message, RMQMessage, RMQRoute, RMQValidate} from "nestjs-rmq";
import {AccountUserCourses, AccountUserInfo} from "@purple/contracts";
import {UserRepository} from "./repositories/user.repository";
import {UserEntity} from "./entities/user.entity";

@Controller()
export class UserQueries {
  constructor(private readonly userRepository: UserRepository ) {
  }

  @RMQValidate()
  @RMQRoute(AccountUserInfo.topic)
  async userInfo(
    @Body() { id }: AccountUserInfo.Request, @RMQMessage msg: Message
  ): Promise<AccountUserInfo.Response> {
    const user = await this.userRepository.findUserById(id);
    const profile = new UserEntity(user).getPublicProfile();
    return {
      profile
    };
  }

  @RMQValidate()
  @RMQRoute(AccountUserCourses.topic)
  async userCourses(
    @Body() { id }: AccountUserCourses.Request, @RMQMessage msg: Message
  ): Promise<AccountUserCourses.Response> {
    const user = await this.userRepository.findUserById(id);
    return {
      courses: user.courses
    };
  }
}
