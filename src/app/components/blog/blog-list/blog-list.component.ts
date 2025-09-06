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
        this.loadFallbackData();
      }
    });
  }

  private loadFallbackData() {
    this.blogPosts = [
      {
        id: '1',
        title: 'Building a High-Concurrency Booking System with DynamoDB and AWS Fargate',
        slug: 'high-concurrency-booking-system-dynamodb-fargate',
        excerpt: 'Learn how to architect and implement a scalable booking system that handles millions of concurrent requests using AWS DynamoDB and Fargate.',
        date: '2025-01-15',
        readTime: '8 min read',
        tags: ['AWS', 'DynamoDB', 'Microservices', 'Scalability'],
        author: 'Deepak Pandey'
      },
      {
        id: '2',
        title: 'RAG + MCP: Wiring GenAI Tools into Real Applications',
        slug: 'rag-mcp-genai-integration',
        excerpt: 'A comprehensive guide to integrating Retrieval-Augmented Generation with Model Context Protocol for production-ready GenAI applications.',
        date: '2025-01-08',
        readTime: '12 min read',
        tags: ['GenAI', 'RAG', 'MCP', 'LangChain'],
        author: 'Deepak Pandey'
      },
      {
        id: '3',
        title: 'Self-Hosted vs Public LLM Providers: A Practical Setup Guide',
        slug: 'self-hosted-vs-public-llm-providers',
        excerpt: 'Compare the pros and cons of self-hosted LLMs versus public providers, with practical implementation examples using Ollama and AWS Bedrock.',
        date: '2025-01-01',
        readTime: '10 min read',
        tags: ['LLM', 'Ollama', 'AWS Bedrock', 'Self-Hosting'],
        author: 'Deepak Pandey'
      }
    ];
  }
}
