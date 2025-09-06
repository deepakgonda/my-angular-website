import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  readTime: string;
  tags: string[];
  author: string;
  category?: string;
  featured?: boolean;
  published?: boolean;
  views?: number;
  likes?: number;
  comments?: number;
  featuredImage?: string;
  summary?: string;
}

@Component({
  selector: 'app-blog-list',
  templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.scss']
})
export class BlogListComponent implements OnInit {
  blogPosts: BlogPost[] = [];
  loading = true;
  error: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadBlogPosts();
  }

  private loadBlogPosts() {
    this.http.get<BlogPost[]>('/assets/data/blogs.json').subscribe({
      next: (posts) => {
        this.blogPosts = posts.filter(post => post.published !== false);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading blog posts:', error);
        this.error = 'Failed to load blog posts';
        this.loading = false;
        // Fallback to hardcoded data
      }
    });
  }

}
