import * as React from 'react';
import cn from 'classnames';
import InfiniteScroll from 'react-infinite-scroll-component';
import ScrollToTop from 'src/components/ScrollToTop';
import Spinner from 'src/components/Spinner';
import { Genre, TagsQueryParams, TagsQueryResponse } from '@game-store-monorepo/data-access';
import { GET_TAGS } from 'src/graphql/queries';
import { useQuery } from '@apollo/client';
import { NavigationContext } from 'src/context/navigation';
import Card from 'src/components/Card';
import { ROUTES } from 'src/routes/routes';
import { useHistory } from 'react-router-dom';
import { getMultipleItemNames } from '@game-store-monorepo/util';
import ViewDisplayOptions from 'src/components/ViewDisplayOptions';

type ViewType = 'Grid' | 'List';

const queryParams: TagsQueryParams = {
  variables: {
    page: 1,
    pageSize: 10,
  },
};

const Tags: React.FC = () => {
  const { push } = useHistory();
  const [viewType, setViewType] = React.useState<ViewType>('Grid');
  const { setTitle } = React.useContext(NavigationContext);

  const gridClass = cn({
    'grid grid-flow-row gap-4 !overflow-y-hidden': true,
    'grid-cols-2': viewType === 'Grid',
    'grid-cols-1': viewType === 'List',
  });

  const loadMoreSpinnerClass = cn({
    'sticky bottom-0 left-1/2 text-center h-12': true,
    'translate-x-[-50%]': viewType === 'Grid',
  });

  const gameListClass = cn({
    'text-sm text-base-content-secondary': true,
    'line-clamp-2': viewType === 'Grid',
  });

  const { data, loading, fetchMore } = useQuery<TagsQueryResponse>(GET_TAGS, queryParams);
  const tagResults = data?.allTags.results;
  const nextPage = data?.allTags.nextPage;
  const hasMore = nextPage ? true : false;

  React.useEffect(() => {
    setTitle('Tags');
  }, [setTitle]);

  const handleFetchMore = React.useCallback(() => {
    fetchMore({
      variables: {
        page: nextPage,
      },
    });
  }, [fetchMore, nextPage]);

  const onViewTypeChange = (type: ViewType) => {
    setViewType(type);
  };

  const onItemClick = (value: Genre) => {
    return () => {
      push(`${ROUTES.GAMES}?tags=${value.id}`);
    };
  };

  return (
    <Spinner isLoading={loading} isFullScreen size={30} className="p-4">
      <ViewDisplayOptions viewType={viewType} onViewTypeChange={onViewTypeChange} />
      <InfiniteScroll
        className={cn(gridClass)}
        dataLength={tagResults?.length || 0}
        scrollThreshold="100px"
        next={handleFetchMore}
        hasMore={hasMore}
        loader={
          <div className={loadMoreSpinnerClass}>
            <Spinner isLoading={true} size={20} theme="ClipLoader" />
          </div>
        }
      >
        {tagResults?.map((item) => {
          const { id, name, thumbnailImage, games } = item;
          return (
            <Card key={id} title={name} headerImageUrl={thumbnailImage} isCompact onClick={onItemClick(item)}>
              <p className={gameListClass}>{getMultipleItemNames(games)}</p>
            </Card>
          );
        })}
      </InfiniteScroll>
      <ScrollToTop />
    </Spinner>
  );
};

export default Tags;
