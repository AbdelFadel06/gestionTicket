from .attachment import AttachmentDetailView, AttachmentListCreateView
from .ticket import TicketViewSet, TicketListCreateView, TicketRetrieveDestroyView, accepted, closed, setstatus, retrieveDestroyComment, CommentCreateView
from .like import add_like_on_comment, add_like_on_ticket, get_all_like_for_comment, get_all_like_for_ticket
