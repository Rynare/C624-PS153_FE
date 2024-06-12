const recipeCardSkelleton = document.createElement("template");
recipeCardSkelleton.innerHTML = `
    <div is="recipe-card" class="recipe-card position-relative rounded bg-white text-black skelleton">
        <div class="card-header">
            <picture class="bg-dark-subtle rounded-top">
                <img class="recipe-thumbnail" src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><rect width='100' height='100' fill='transparent'/></svg>">
            </picture>
            <div class="recipe-likes rounded-start-pill small skelleton-item">
                <i class="bi bi-heart-fill"></i>
                <span>0 Like</span>
            </div>
        </div>
        <div class="card-body my-2 mx-2">
            <div class="recipe-header px-1 mb-2 border-bottom border-subtle">
                <h6 class="recipe-name pb-1 skelleton-item">Title Title Title Title Title Title Title Title Title</h6>
            </div>
            <div class="recipe-sub-header d-flex flex-column row-gap-1 mx-2 mb-3 small">
                <div class="fw-semibold recipe-duration skelleton-item">
                    <i class="bi bi-stopwatch"></i>
                    <span class="ms-2">recipe-duration</span>
                </div>
                <div class="fw-semibold recipe-difficulty skelleton-item">
                    <i class="bi bi-speedometer2"></i>
                    <span class="ms-2">recipe-difficulty</span>
                </div>
                <div class="fw-semibold recipe-calories skelleton-item">
                    <i class="bi bi-fire"></i>
                    <span class="ms-2">recipe-calories</span>
                </div>
            </div>
        </div>
        <div class="card-footer">
            <a href="javascript:void(0)" class="button-44 btn nav-pils pt-1 rounded-pill px-4 fw-bold"
                style="color: transparent;">Lets
                Cook</a>
        </div>
    </div>
`;
export { recipeCardSkelleton };
