import { Injectable } from '@nestjs/common';
import { from, Observable, of } from "rxjs";
import { BlogEntry } from "./models/blog-entry.interface";
import { User } from "../user/models/user.interface";
import { InjectRepository } from "@nestjs/typeorm";
import { BlogEntryEntity } from "./models/blog-entry.entity";
import { Repository } from "typeorm";
import { UserService } from "../user/user.service";
import { switchMap, tap } from "rxjs/operators";
const slugify = require('slugify');

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
    return this.generateSlug(blogEntry.title).pipe(
      switchMap((slug: string) => {
        blogEntry.slug = slug;
        return from(this.blogRepository.save(blogEntry));
      })
    )
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

  updateOne(id: number, blogEntry: BlogEntry): Observable<BlogEntry> {
    return from(this.blogRepository.update(id, blogEntry)).pipe(
      switchMap(() => this.findOne(id)),
    )
  }

  deleteOne(id: number): Observable<any> {
    return from(this.blogRepository.delete(id));
  }

  generateSlug(title: string): Observable<string> {
    return of(slugify(title));
  }

}
