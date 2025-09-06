import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  readTime: string;
  views: number;
  likes: number;
  comments: number;
  category: string;
  featured: boolean;
  published: boolean;
  author: {
    name: string;
    avatar: string;
    bio: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
}

export interface BlogPostDetail {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  readTime: string;
  views: number;
  likes: number;
  comments: number;
  category: string;
  featured: boolean;
  published: boolean;
  author: {
    name: string;
    avatar: string;
    bio: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  content: {
    type: 'heading' | 'paragraph' | 'code' | 'list' | 'image' | 'table';
    data: any;
  }[];
  tableOfContents: {
    id: string;
    title: string;
    level: number;
  }[];
  tags: string[];
  relatedPosts: number[];
}

@Component({
  selector: 'app-blog-detail',
  templateUrl: './blog-detail.component.html',
  styleUrls: ['./blog-detail.component.scss']
})
export class BlogDetailComponent implements OnInit {
  post: BlogPostDetail | null = null;
  isLoading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const slug = params['slug'];
      if (slug) {
        this.loadBlogPost(slug);
      } else {
        this.router.navigate(['/blog']);
      }
    });
  }

  private loadBlogPost(slug: string): void {
    this.isLoading = true;
    this.error = null;

    // First, load the blog index to find the post ID
    this.http.get<{ posts: BlogPost[] }>('/assets/data/blogs.json').subscribe({
      next: (data) => {
        const blogPost = data.posts.find(post => post.slug === slug);
        if (blogPost) {
          // Load the detailed blog post data
          this.http.get<BlogPostDetail>(`/assets/data/blog-post-${blogPost.id}.json`).subscribe({
            next: (detailData) => {
              this.post = detailData;
              this.isLoading = false;
            },
            error: (error) => {
              console.error('Error loading blog post details:', error);
              this.error = 'Failed to load blog post details';
              this.isLoading = false;
            }
          });
        } else {
          this.error = 'Blog post not found';
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error loading blog index:', error);
        this.error = 'Failed to load blog posts';
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/blog']);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  renderContent(content: { type: string; data: any }): string {
    switch (content.type) {
      case 'heading':
        return `<h${content.data.level} id="${content.data.id}" class="text-${content.data.level === 1 ? '4xl' : content.data.level === 2 ? '3xl' : '2xl'} font-bold text-gray-900 dark:text-white mb-4">${content.data.text}</h${content.data.level}>`;
      
      case 'paragraph':
        return `<p class="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">${content.data.text}</p>`;
      
      case 'code':
        return `
          <div class="bg-gray-900 dark:bg-gray-800 rounded-lg p-4 mb-6 overflow-x-auto">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-gray-400">${content.data.language}</span>
              <button class="text-sm text-blue-400 hover:text-blue-300">Copy</button>
            </div>
            <pre class="text-green-400"><code>${content.data.code}</code></pre>
          </div>
        `;
      
      case 'list':
        const listItems = content.data.items.map((item: string) => `<li class="text-gray-700 dark:text-gray-300 mb-2">${item}</li>`).join('');
        const listTag = content.data.ordered ? 'ol' : 'ul';
        const listClass = content.data.ordered ? 'list-decimal' : 'list-disc';
        return `<${listTag} class="${listClass} list-inside mb-6 space-y-2">${listItems}</${listTag}>`;
      
      case 'image':
        return `
          <figure class="mb-8">
            <img src="${content.data.src}" alt="${content.data.alt}" class="w-full rounded-lg shadow-lg">
            ${content.data.caption ? `<figcaption class="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">${content.data.caption}</figcaption>` : ''}
          </figure>
        `;
      
      case 'table':
        const headers = content.data.headers.map((header: string) => `<th class="px-4 py-2 text-left text-gray-900 dark:text-white font-semibold">${header}</th>`).join('');
        const rows = content.data.rows.map((row: string[]) => 
          `<tr class="border-b border-gray-200 dark:border-gray-700">${row.map(cell => `<td class="px-4 py-2 text-gray-700 dark:text-gray-300">${cell}</td>`).join('')}</tr>`
        ).join('');
        return `
          <div class="overflow-x-auto mb-8">
            <table class="w-full border border-gray-200 dark:border-gray-700 rounded-lg">
              <thead class="bg-gray-50 dark:bg-gray-800">
                <tr>${headers}</tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        `;
      
      default:
        return '';
    }
  }
}
