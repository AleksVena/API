/** Класс, описывающий перехваченные ошибки */
export class CustomError {
  successfull: boolean;
  statusCode: number;
  message: string | Record<string, any>;
  timestamp: string;
  path: string;
}
