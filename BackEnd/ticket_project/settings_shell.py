
# import sys
# import colorlog
# import logging


# class SQLFormatter(colorlog.ColoredFormatter):
#     def format(self, record):
#         message = record.getMessage()

#         sql_keywords = {
#             "SELECT": "bold_blue",
#             "INSERT": "bold_green",
#             "UPDATE": "bold_yellow",
#             "DELETE": "bold_red",
#             "FROM": "cyan",
#             "WHERE": "magenta",
#             "JOIN": "bold_cyan",
#             "ORDER BY": "white",
#             "GROUP BY": "white",
#         }


#         for keyword, color in sql_keywords.items():
#             message = message.replace(
#                 keyword,
#                 self.colorize(keyword, color)
#             )

#         record.msg = message
#         return super().format(record)

#     def colorize(self, text, color):
#         c = colorlog.escape_codes.parse_colors(color)
#         return f"{c}{text}{colorlog.escape_codes.reset}"




# LOGGING = {
#     'version': 1,
#     'disable_existing_loggers': False,

#     'formatters': {
#         'colored_sql': {
#             '()': 'colorlog.ColoredFormatter',
#             'format': '%(cyan)s%(message)s%(reset)s',
#         },
#     },

#     'handlers': {
#         'console': {
#             'level': 'DEBUG',
#             'class': 'logging.StreamHandler',
#             'formatter': 'colored_sql',
#         },
#     },

#     'loggers': {
#         'django.db.backends': {
#             'level': 'DEBUG',
#             'handlers': ['console'],
#             'propagate': False,
#         },
#     },
# }