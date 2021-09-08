import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { DatabaseError as PGException } from 'pg-protocol';
import { RequestError as MSSQLException } from 'tedious';
import { CustomError } from '../../error.type';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter, CustomError {
  successfull: boolean;
  statusCode: number;
  message: string | Record<string, any>;
  timestamp: string;
  path: string;

  private getResponsePayload(): CustomError {
    return {
      successfull: false,
      statusCode: this.statusCode,
      message: this.message,
      timestamp: this.timestamp,
      path: this.path,
    };
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    let responseObject: Record<string, any> = {};
    this.path = request.url;
    this.timestamp = new Date().toISOString();

    // PG ошибка
    if (exception instanceof PGException) {
      this.statusCode = HttpStatus.BAD_REQUEST;
      const errorMessage = JSON.parse(exception.message);
      // error_severity = 12 - обработанная ошибка бизнес-логики
      if (errorMessage && errorMessage.error_severity == 12) this.message = { name___Kz: errorMessage.user_msg___kz, name___Ru: errorMessage.user_msg___ru };
      else {
        // системные ошибки
        console.error(`${new Date().toISOString()} - errorHandler: `, exception.stack);
        this.message = JSON.parse(exception.message);
      }
    }

    // MSSQL ошибка
    else if (exception instanceof MSSQLException) {
      // timeout при слишком долгой отработке процедуры
      if (exception.code === "ETIMEOUT") {
        this.statusCode = HttpStatus.GATEWAY_TIMEOUT;
      }
      // class (State) = 13 - обработанная ошибка бизнес-логики. Всё остальное - системные ошибки
      if (exception && exception['class'] == 13) this.message = { name___Kz: exception.message, name___Ru: exception.message };
      else {
        // системные ошибки логируем
        console.error(`${new Date().toISOString()} - errorHandler: `, exception.stack);
        this.message = exception.message;
      }
    }

    // HTTP ошибка (BadRequestException и прочее являются потомками данного класса)
    else if (exception instanceof HttpException) {
      this.statusCode = exception.getStatus();
      this.message = exception.getResponse();
    }
    // все остальные ошибки
    else {
      this.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      this.message = 'Internal Server Error';
      console.error(`${new Date().toISOString()} - errorHandler: `, exception['stack']);
    }

    responseObject = this.getResponsePayload();

    response.status(this.statusCode).json(responseObject);
  }
}
