import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query, Req, Res,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { UserService } from "./user.service";
import { Observable, of } from "rxjs";
import { User, UserRole } from "./models/user.interface";
import { catchError, map, tap } from "rxjs/operators";
import { Pagination } from "nestjs-typeorm-paginate";
import { hasRoles } from "../auth/decorator/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-guard";
import { RolesGuard } from "../auth/guards/roles-guard";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
const path = require('path');
import { join } from 'path';
import { UserIsUserGuard } from "../auth/guards/UserIsUser.guard";

export const storage = {
  storage: diskStorage(({
    destination: './uploads/profileimages',
    filename: (req, file, cb) => {
      const filename: string = path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
      const extention: string = path.parse(file.originalname).ext;
      cb(null, `${filename}${extention}`);
    }
  }))
}

@Controller('users')
export class UserController {

  constructor(private userService: UserService) {
  }

  @Post()
  create(@Body() user: User): Observable<User | Object> {
    return this.userService.create(user).pipe(
      map((user: User) => user),
      catchError((err) => of({ error: err.message }))
    )
  }

  @Post('login')
  login(@Body() user: User): Observable<Object> {
    return this.userService.login(user).pipe(
      map((jwt: string) => {
        return { access_token: jwt };
      }),
    );
  }

  @Get(':id')
  findOne(@Param() params): Observable<User> {
    return this.userService.findOne(params.id);
  }

  @Get()
  index(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 2,
    @Query('username') username: string,
  ): Observable<Pagination<User>> {
    limit = limit > 100 ? 100 : limit;

    if(username === null || username === undefined) {
      return this.userService.paginate({
        page,
        limit,
        route: 'http://localhost:3000/users/',
      });
    } else {
      return this.userService.paginateFIlterByUsername(
        { page, limit, route: 'http://localhost:3000/users/' },
        { username },
      )
    }
  }
  @hasRoles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  deleteOne(@Param('id') id: string): Observable<User> {
    return this.userService.deleteOne(Number(id));
  }

  @UseGuards(JwtAuthGuard, UserIsUserGuard)
  @Put(':id')
  updateOne(@Param('id') id: string, @Body() user: User): Observable<any> {
    return this.userService.updateOne(Number(id), user);
  }

  @hasRoles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id/role')
  updateRoleOfUser(
    @Param('id') id: string,
    @Body() user: User
  ): Observable<User> {
    return this.userService.updateRoleOfUser(Number(id), user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', storage))
  uploadFile(@UploadedFile() file, @Req() req): Observable<Object> {
    const user: User = req.user;

    return this.userService.updateOne(user.id, { profileImage: file.filename }).pipe(
      tap((user:User) => console.log(user)),
      map((user:User) => ({
        profileImage: user.profileImage,
      }))
    )
  }

  @Get('profile-image/:imagename')
  findProfileImage(@Param('imagename') imagename, @Res() res): Observable<Object> {
    return of(res.sendFile(join(process.cwd(), 'uploads/profileimages/' + imagename)));
  }

}
