import arxiv

def get_authors(authors, first_author = False):
    output = str()
    if first_author == False:
        output = ", ".join(str(author) for author in authors)
    else:
        output = authors[0]
    return output

def get_daily_papers(topic,query="slam", max_results=2):
    """
    @param topic: str
    @param query: str
    @return paper_with_code: dict
    """

    # output 
    content = dict() 
    
    search_engine = arxiv.Search(
        query = query,
        max_results = max_results,
        sort_by = arxiv.SortCriterion.SubmittedDate
    )

    for result in search_engine.results():

        paper_id       = result.get_short_id()
        paper_title    = result.title
        paper_url      = result.entry_id

        paper_abstract = result.summary.replace("\n"," ")
        paper_authors  = get_authors(result.authors)
        paper_first_author = get_authors(result.authors,first_author = True)
        primary_category = result.primary_category

        publish_time = result.published.date()

        print("Time = ", publish_time ,
              " title = ", paper_title,
              " author = ", paper_first_author)

        # eg: 2108.09112v1 -> 2108.09112
        ver_pos = paper_id.find('v')
        if ver_pos == -1:
            paper_key = paper_id
        else:
            paper_key = paper_id[0:ver_pos] 

        content[paper_key] = f"|**{publish_time}**|**{paper_title}**|{paper_first_author} et.al.|[{paper_id}]({paper_url})|\n"
    data = {topic:content}
    
    return data 
 
 
if __name__ == "__main__":

    data_collector = []
    keywords = dict()
    keywords["SLAM"] = "SLAM"
 
    for topic,keyword in keywords.items():
 
        print("Keyword: " + topic)
        data = get_daily_papers(topic, query = keyword, max_results = 10)
        data_collector.append(data)
        print("\n")



