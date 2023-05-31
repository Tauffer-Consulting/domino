from sqlalchemy.orm import Query


class CustomQuery(Query):
    """
    Custom sqlalchemy query object dynamic filtering using suffixes.
    """
    def __init__(self, entities, session=None):
        super().__init__(entities, session)
        self.operators_map = {
            "in": lambda f, a: f.in_(a),
            "eq": lambda f, a: f == a,
            "not": lambda f, a: f != a,
            "ge": lambda f, a: f >= a,
            "le": lambda f, a: f <= a,
            "gt": lambda f, a: f > a,
            "lt": lambda f, a: f < a,
            "like": lambda f, a: f.like(f"%{a}%"),
        }

    def _get_model(self):
        """
        Get ORM model from query object.
        """
        return self._raw_columns[0]._annotations["parententity"].mapper.base_mapper.class_

    def magic_filter(self, filters: dict):
        """
        Magic filter method used to filter data using pre defined suffixes.
        # TODO add more suffixes
        # TODO add more operators (or, not, etc)

        Usage Example:
        query = session.query(User).magic_filter({
            'name__eq': 'John',
            'age__gt': 20,
        })
        results: User object with name John and age > 20

        Args:
            filters (dict): Dictionary of filters.

        Returns:
            Query: Sqlalchemy query object
        """
        model = self._get_model()
        for filter_key, filter_value in filters.items():
            attr, *operator_name = filter_key.split('__')
            if not operator_name:
                operator_name = ['eq']
            operator_name = operator_name[0]
            operator = self.operators_map.get(operator_name, None)
            if operator is None:
                # TODO add custom exception
                raise Exception(f"Piece {operator_name} not found")
            self = self.filter(operator(getattr(model, attr), filter_value))
        return self

    def paginate(self, page: int = 0, page_size: int = 100):
        """Aux method to paginate query results.

        Args:
            page (int, optional): Page number, it defines the offset. Defaults to 1.
            page_size (int, optional): Page size, it defines the number of records to be recovered. Defaults to 100.

        Returns:
            List of sqlalchemy models with query results
        """
        page_size = max(1, min(page_size, 100))
        return self.offset((page) * page_size).limit(page_size).all()