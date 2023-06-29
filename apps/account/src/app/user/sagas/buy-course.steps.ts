import {BuyCourseSagaState} from "./buy-course.state";
import {UserEntity} from "../entities/user.entity";
import {CourseGetCourse, PaymentGenerateLink} from "@purple/contracts";
import {PurchaseState} from "@purple/interfaces";

export class BuyCourseSagaStateStarted extends BuyCourseSagaState {
  public async pay(): Promise<{ paymentLink: string; user: UserEntity }> {
    const { course } = await this.saga.rmqService.send<CourseGetCourse.Request, CourseGetCourse.Response>(CourseGetCourse.topic, {
      id: this.saga.courseId
    });
    if(!course) {
      throw new Error('This course is not exist!')
    }
    if (course.price == 0) {
      this.saga.setState(PurchaseState.Purchased, course._id);
      return { paymentLink: null, user: this.saga.user };
    }
    const { paymentLink } = await this.saga.rmqService.send<PaymentGenerateLink.Request, PaymentGenerateLink.Response>(PaymentGenerateLink.topic, {
      courseId: course._id,
      userId: this.saga.user._id,
      sum: course.price
    });
    this.saga.setState(PurchaseState.WaitingForPayment, course._id);
    return { paymentLink, user: this.saga.user };
  }
  public checkPayment(): Promise<{ user: UserEntity }> {
    throw new Error('Can\'t check payment which is not started!');
  }
  public async cancel(): Promise<{ user: UserEntity }> {
    this.saga.setState(PurchaseState.Canceled, this.saga.courseId);
    return { user: this.saga.user };
  }
}

export class BuyCourseSagaStateProcess extends BuyCourseSagaState {
  cancel(): Promise<{ user: UserEntity }> {
    return Promise.resolve({user: undefined});
  }

  checkPayment(): Promise<{ user: UserEntity }> {
    return Promise.resolve({user: undefined});
  }

  pay(): Promise<{ paymentLink: string; user: UserEntity }> {
    return Promise.resolve({paymentLink: "", user: undefined});
  }
}
