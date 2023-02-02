import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { v4 } from 'uuid';
import { add } from 'date-fns';

export type UserDocument = HydratedDocument<User>;

type StaticUserMethods = {
  make: (
    this: IUserModel,
    login: string,
    password: string,
    email: string,
    isConfirmed: boolean
  ) => UserDocument;
};

export type IUserModel = Model<UserDocument> & StaticUserMethods;

class PasswordRecoveryConfirmation {
  @Prop({ required: true })
  passwordRecoveryCode: string;

  @Prop({ required: true })
  expirationDate: Date;

  @Prop({ required: true })
  isConfirmed: boolean;
}

class EmailConfirmation {
  @Prop({ required: true })
  confirmationCode: string;

  @Prop({ required: true })
  expirationDate: Date;

  @Prop({ required: true })
  isConfirmed: boolean;
}

@Schema()
export class User {
  @Prop({ required: true, maxlength: 10, minlength: 3 })
  login: string;

  @Prop({ required: true })
  hash: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  createdAt: string;

  @Prop({ required: true })
  passwordRecoveryConfirmation: PasswordRecoveryConfirmation;

  @Prop({ required: true })
  emailConfirmation: EmailConfirmation;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.statics.make = function (
  this: IUserModel,
  login: string,
  password: string,
  email: string,
  isConfirmed: boolean
) {
  const passwordSalt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, passwordSalt);
  const newDate = new Date();
  return new this({
    login: login,
    hash: passwordHash,
    email: email,
    createdAt: newDate.toISOString(),
    passwordRecoveryConfirmation: {
      passwordRecoveryCode: v4(),
      expirationDate: add(newDate, {
        hours: 1
      }),
      isConfirmed: true
    },
    emailConfirmation: {
      confirmationCode: v4(),
      expirationDate: add(newDate, {
        hours: 1
      }),
      isConfirmed: isConfirmed
    }
  });
};
