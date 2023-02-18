export class OutputBloggerCommentsDto {
  id: string;
  content: string;
  createdAt: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  postInfo: {
    id: string;
    title: string;
    blogId: string;
    blogName: string;
  };
}
