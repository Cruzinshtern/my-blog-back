import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { BlogService } from "./blog.service";
import { Observable } from "rxjs";
import { BlogEntry } from "./models/blog-entry.interface";
import { JwtAuthGuard } from "../auth/guards/jwt-guard";

@Controller('blogs')
export class BlogController {

  constructor(private blogService: BlogService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() blogEntry: BlogEntry, @Req() req): Observable<BlogEntry> {
    const user = req.user.user;
    return this.blogService.create(user, blogEntry);
  }

  @Get()
  findBlogEntries(
    @Query('userId') userId: number,
  ): Observable<BlogEntry[]> {
    if(userId == null) {
      return this.blogService.findAll();
    } else {
      return this.blogService.findByUser(userId);
    }
  }

  @Get(':id')
  findOne(@Param('id') id: number): Observable<BlogEntry> {
    return this.blogService.findOne(id);
  }
}
