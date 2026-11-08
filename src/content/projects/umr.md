---
title: Unified Model Records
kicker: Research · 2024
tagline: Model cards were built for people to read. As models fork and fine-tune, we also need records that machines can read and lineage we can trace.
blurb: A machine-readable spec for documenting AI models that traces what each model inherits from its foundation model, with a hosted record browser.
org: Research · NeurIPS workshop paper
years: '2024'
featured: true
group: recent
kind: live
started: 2024
ended: 2024
url: https://modelrecord.com/
hero: ../../assets/work/umr-site.png
heroCaption: modelrecord.com
meta:
  - { label: Type, value: Research paper + open tooling }
  - { label: Venue, value: NeurIPS 2024 workshop }
  - { label: Role, value: Co-author }
  - { label: Status, value: 'Proof of concept, live' }
links:
  - { label: modelrecord.com ↗, href: 'https://modelrecord.com/' }
  - { label: Paper on arXiv ↗, href: 'https://arxiv.org/abs/2410.02230' }
credits:
  - role: Co-authors
    people: [Keyu Wang, Abdullah Norozi Iranzad, Scott Schaffter, Meg Risdal, Doina Precup, Jon Lebensold]
  - role: Collaborators
    people: [Ahrav Dutta]
  - role: Paper
    note: Mitigating Downstream Model Risks via Model Provenance (arXiv 2410.02230)
  - role: Venue
    note: NeurIPS 2024 workshop
  - role: Code + site
    note: modelrecord.com
---

## The gap

Foundation models are adopted faster than the tools for tracking them. Model cards and system cards help, but they are written by hand, hard to compare, and say little about where a model came from.

Software supply chains faced the same problem years ago. AI is earlier on that curve.

## The proposal

A machine-readable spec for model records. When a model inherits most of its design from a foundation model, the record inherits too, so publishers only describe what changed.

Each record explicitly links upstream and downstream models, so genealogy becomes something you can query instead of something you have to piece together.

## The tooling

A semantically versioned repository that publishes each record to PDF, HTML, and LaTeX, and a hosted browser at modelrecord.com.

It is a proof of concept meant to be adopted by model publishers, open-source maintainers, and distribution platforms.
