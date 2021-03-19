import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { UserService } from "../../user/user.service";
import { BlogService } from "../../blog/blog.service";
import { Observable } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { User } from "../../user/models/user.interface";
import { BlogEntry } from "../../blog/models/blog-entry.interface";

@Injectable()
export class UserIsAuthorGuard implements CanActivate{

  constructor(
    private userService: UserService,
    private blogService: BlogService
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const params = request.params;
    const blogEntryId: number = Number(params.id);
    const user = request.user;

    return this.userService.findOne(user.id).pipe(
      switchMap((user: User) => this.blogService.findOne(blogEntryId). pipe(
        map((blogEntry: BlogEntry) => {
          let hasPermission = false;

          if(user.id === blogEntry.author.id) {
            hasPermission = true;
          }

          return user && hasPermission;
        })
      ))
    )
  }
}
