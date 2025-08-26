from .user import IsDeveloper, IsAdmin, IsPermitted
from .ticket import IsAuthor, IsRealDeveloper, RetrievePermission, AcceptPermission, ClosePermission, CommentPermission
from .comment import IsAuthor as IsCommentAuthor