export class OutputPostDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: StatusLikeType;
    newestLikes: [
      {
        addedAt: string;
        userId: string;
        login: string;
      }
    ];
  };
}

type StatusLikeType = 'None' | 'Like' | 'Dislike';
