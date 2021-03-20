import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from "@nestjs/common";
import { BlogService } from "./blog.service";
import { Observable } from "rxjs";
import { BlogEntry } from "./models/blog-entry.interface";
import { JwtAuthGuard } from "../auth/guards/jwt-guard";
import { UserIsAuthorGuard } from "../auth/guards/UserIsAuthor.guard";

export const BLOG_ENTRIES_URL = 'http://localhost:3000/blog-entries';

@Controller('blog-entries')
export class BlogController {

  constructor(private blogService: BlogService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() blogEntry: BlogEntry, @Req() req): Observable<BlogEntry> {
    const user = req.user;
    return this.blogService.create(user, blogEntry);
  }

  // @Get()
  // findBlogEntries(
  //   @Query('userId') userId: number,
  // ): Observable<BlogEntry[]> {
  //   if(userId == null) {
  //     return this.blogService.findAll();
  //   } else {
  //     return this.blogService.findByUser(userId);
  //   }
  // }

  @Get()
  index(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    limit = limit > 100 ? 100 : limit;
    return this.blogService.paginateAll({
      limit: Number(limit),
      page: Number(page),
      route: BLOG_ENTRIES_URL,
    })
  }

  @Get('user/:user')
  indexByUser(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Param('user') userId: number,
  ) {
    limit = limit > 100 ? 100 : limit;
    return this.blogService.paginateByUser({
      limit: Number(limit),
      page: Number(page),
      route: BLOG_ENTRIES_URL + '/user/' + userId,
    }, Number(userId))
  }

  @Get(':id')
  findOne(@Param('id') id: number): Observable<BlogEntry> {
    return this.blogService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, UserIsAuthorGuard)
  @Put(':id')
  updateOne(
    @Param('id') id: number,
    @Body() blogEntry: BlogEntry
  ): Observable<BlogEntry> {
    return this.blogService.updateOne(Number(id), blogEntry)
  }

  @UseGuards(JwtAuthGuard, UserIsAuthorGuard)
  @Delete(':id')
  deleteOne(@Param('id') id: number): Observable<any> {
    return this.blogService.deleteOne(id);
  }
}
