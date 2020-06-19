# 1. Use `saga` as the name for the main branch

Historically, Git and other software use terms such as _master/slave_,
_whitelist/blacklist_ which are based on racial concepts. Their continued use
maintains the racial stereo-types they depict. Better alternatives in meaning
and technical correctness exist, like _leader/follower_, _blocklist/allowlist_.

In the Nordic mythology, a _saga_ is a long continuous recollection of histories
of stories about the history of humans, legends and gods. This idea reflects
very well what happens in a Git repository. Changes happen in branches (some
teams tie them to _User Stories_), which are sometimes directly, sometimes
loosely coupled to the main branch. Once they are finished they get added to the
main branch, or get appended in case of a rebase. The mental model of a big book
of stories fits this process very well.

Therefore the main branch in this repository is named `saga`.
