import { Injectable } from '@nestjs/common';
import { from, Observable } from "rxjs";
import { BlogEntry } from "./models/blog-entry.interface";
import { User } from "../user/models/user.interface";
import { InjectRepository } from "@nestjs/typeorm";
import { BlogEntryEntity } from "./models/blog-entry.entity";
import { Repository } from "typeorm";
import { UserService } from "../user/user.service";

@Injectable()
export class BlogService {

  constructor(
    @InjectRepository(BlogEntryEntity)
    private readonly blogRepository: Repository<BlogEntryEntity>,
    private userService: UserService,
  ) {
  }

  create(user: User, blogEntry: BlogEntry): Observable<BlogEntry> {
    blogEntry.author = user;
    return from(this.blogRepository.save(blogEntry));
  }

  findAll(): Observable<BlogEntry[]> {
    return from(this.blogRepository.find({
      relations: ['author']
    }));
  }

  findByUser(userId: number): Observable<BlogEntry[]> {
    return from(this.blogRepository.find({
      where: {
        author: userId
      },
      relations: ['author']
    }))
  }

  findOne(id: number): Observable<BlogEntry> {
    return from(this.blogRepository.findOne(
      { id },
      { relations: ['author'] }
      ))
  }


}
