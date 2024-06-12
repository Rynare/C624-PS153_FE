const articleCardSkelleton = document.createElement("template");
articleCardSkelleton.innerHTML = `
    <div is="article-card" class="article-card overflow-hidden rounded skelleton">
        <div class="card-thumbnail">
            <picture>
                <img class="article-thumbnail rounded skelleton-item" src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><rect width='100' height='100' fill='transparent'/></svg>">
            </picture>
            <div class="card-sub-thumbnail px-3 py-2 p-sm-3">
            </div>
        </div>
        <div class="card-body bg-dark px-2 py-2">
            <small class="article-category badge mb-1 skelleton-item">category</small>
            <a is="link-router" href="#javascript:void(0)/" class="nav-link mt-1 mt-sm-2 mb-md-1 skelleton-item">
                <h6 class="article-title pb-1 mb-0">Title title title title title title</h6>
            </a>
            <small class="article-author skelleton-item rounded px-2 pb-0 me-1 text-truncate d-inline-flex mb-0 gap-1">
                <i class="bi bi-person"></i>
                <span class="small text-truncate">author author author</span>
            </small>
            <div class="article-likes badge skelleton-item">
                <i class="bi bi-heart-fill"></i>
                <span class="ms-1">999 Like</span>
            </div>
        </div>
    </div>
`;

export { articleCardSkelleton };
